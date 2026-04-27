import asyncio
import json
import logging
import mimetypes
import re
import time
from typing import Any
from urllib.parse import urlparse
from uuid import UUID, uuid4

import httpx
from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, ValidationError, conint, field_validator
from supabase import Client, create_client

from app.core.config import Settings


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    video_url: HttpUrl = Field(description="Supabase Storage public URL for the video")
    user_id: UUID | None = Field(default=None, description="Optional authenticated user UUID")

    @field_validator("video_url")
    @classmethod
    def validate_supabase_storage_url(cls, value: HttpUrl) -> HttpUrl:
        parsed = urlparse(str(value))
        is_supabase_host = parsed.netloc.endswith("supabase.co")
        has_storage_path = "/storage/v1/object/" in parsed.path
        if not is_supabase_host or not has_storage_path:
            raise ValueError("video_url must be a valid Supabase Storage URL")
        return value


class AnalyzeResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    class HookStrength(BaseModel):
        model_config = ConfigDict(extra="forbid")

        score: conint(ge=0, le=10)
        analysis: str = Field(min_length=20, max_length=1200)

    overall_score: conint(ge=0, le=100)
    hook_strength: HookStrength
    pacing_analysis: str = Field(min_length=30, max_length=2000)
    caption_optimization: str = Field(min_length=20, max_length=1200)
    actionable_feedback: list[str] = Field(min_length=3, max_length=3)
    trending_recommendations: list[str] = Field(min_length=4, max_length=8)

    @field_validator("actionable_feedback")
    @classmethod
    def validate_actionable_feedback(cls, value: list[str]) -> list[str]:
        cleaned = [item.strip() for item in value]
        if any(not item for item in cleaned):
            raise ValueError("actionable_feedback items must be non-empty")
        return cleaned

    @field_validator("trending_recommendations")
    @classmethod
    def validate_trending_recommendations(cls, value: list[str]) -> list[str]:
        cleaned = [item.strip() for item in value]
        if any(not item for item in cleaned):
            raise ValueError("trending_recommendations items must be non-empty")

        has_audio = any(item.lower().startswith("audio:") for item in cleaned)
        has_hashtag = any(item.lower().startswith("hashtag:") for item in cleaned)
        if not has_audio or not has_hashtag:
            raise ValueError("trending_recommendations must include at least one 'Audio:' and one 'Hashtag:' entry")

        return cleaned


class AIScorerService:
    RETRYABLE_STATUS_CODES = {429, 503}
    MAX_RETRIES = 3

    def __init__(self, settings: Settings):
        self.settings = settings
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is required")
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")

        self.supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        self.logger = logging.getLogger(__name__)

    async def analyze(self, video_url: str, user_id: UUID | None) -> AnalyzeResponse:
        request_id = str(uuid4())
        started_at = time.perf_counter()

        audit_row_id = await asyncio.to_thread(
            self._insert_audit_log,
            request_id,
            video_url,
            str(user_id) if user_id else None,
        )

        try:
            analysis, raw_ai_logic, model_used = await self._call_gemini(video_url)
            latency_ms = int((time.perf_counter() - started_at) * 1000)

            audit_output_payload = {
                **analysis.model_dump(),
                "raw_ai_logic": raw_ai_logic,
            }

            await asyncio.to_thread(
                self._update_audit_log_success,
                audit_row_id,
                request_id,
                audit_output_payload,
                latency_ms,
                model_used,
            )
            return analysis
        except HTTPException as exc:
            latency_ms = int((time.perf_counter() - started_at) * 1000)
            await asyncio.to_thread(
                self._update_audit_log_failure,
                audit_row_id,
                request_id,
                str(exc.detail),
                latency_ms,
            )
            raise
        except Exception as exc:  # noqa: BLE001
            latency_ms = int((time.perf_counter() - started_at) * 1000)
            await asyncio.to_thread(
                self._update_audit_log_failure,
                audit_row_id,
                request_id,
                f"Unexpected backend error: {exc}",
                latency_ms,
            )
            raise HTTPException(status_code=500, detail="Unexpected backend error") from exc

    async def _call_gemini(self, video_url: str) -> tuple[AnalyzeResponse, str, str]:
        mime_type = self._guess_mime_type(video_url)

        system_instruction = """
You are an elite AI Content Virality Analyzer designed to reverse-engineer short-form video content.

OPERATING DIRECTIVES (MANDATORY):
1) Hook Analysis is crucial. Isolate and audit the first 3.0 seconds only. Be ruthless.
   - Evaluate visual movement intensity and novelty.
   - Evaluate text overlay clarity, speed, and cognitive load.
   - Evaluate audio hook immediacy (voice cue, beat drop, SFX, silence strategy).

2) Pacing & Retention Analysis:
   - Evaluate cut frequency and visual state changes.
   - Evaluate narrative speed and payoff timing.
   - Flag retention leaks, dead air, or low-information segments.

3) Competitor Benchmarking (Synthetic):
   - Benchmark against 2026 Viral Archetypes:
     a) High-Retention Storytelling
     b) Fast-Paced Educational
     c) Trend-Jacking
   - Explicitly compare this video against each archetype baseline.
   - State where the video underperforms or outperforms baseline patterns.

4) Actionability Standards:
   - No generic advice (forbidden examples: "improve lighting", "make it better", "be more engaging").
   - Every feedback item must be hyper-specific and timestamped.
   - Use directive language with exact edits (e.g., "Cut the 0.5s pause at 0:02 to maintain hook loop").

OUTPUT CONTRACT (STRICT):
- Return ONLY valid JSON.
- Do not include markdown, prose preamble, or extra keys.
- JSON must match this exact structure:
{
  "overall_score": <int between 0-100>,
  "hook_strength": {
    "score": <int between 0-10>,
    "analysis": "<Specific visual/audio breakdown of the first 3 seconds>"
  },
  "pacing_analysis": "<Detailed feedback on editing speed and competitor benchmark comparison>",
    "caption_optimization": "<Optimized publish-ready caption with hook, curiosity gap, and CTA>",
  "actionable_feedback": [
    "<Hyper-specific edit directive 1>",
    "<Hyper-specific edit directive 2>",
    "<Hyper-specific edit directive 3>"
    ],
    "trending_recommendations": [
        "Audio: <specific trending audio recommendation aligned to this video>",
        "Audio: <specific backup trending audio recommendation>",
        "Hashtag: <specific niche hashtag recommendation>",
        "Hashtag: <specific reach hashtag recommendation>"
  ]
}
""".strip()

        task_instruction = (
            "Analyze the provided short-form video file and return only the strict JSON output. "
            "Do not emit any additional keys, comments, markdown, or explanations outside JSON."
        )

        payload: dict[str, Any] = {
            "systemInstruction": {
                "parts": [{"text": system_instruction}],
            },
            "contents": [
                {
                    "parts": [
                        {"text": task_instruction},
                        {"file_data": {"mime_type": mime_type, "file_uri": video_url}},
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "OBJECT",
                    "required": [
                        "overall_score",
                        "hook_strength",
                        "pacing_analysis",
                        "caption_optimization",
                        "actionable_feedback",
                        "trending_recommendations",
                    ],
                    "propertyOrdering": [
                        "overall_score",
                        "hook_strength",
                        "pacing_analysis",
                        "caption_optimization",
                        "actionable_feedback",
                        "trending_recommendations",
                    ],
                    "properties": {
                        "overall_score": {
                            "type": "INTEGER",
                            "minimum": 0,
                            "maximum": 100,
                        },
                        "hook_strength": {
                            "type": "OBJECT",
                            "required": ["score", "analysis"],
                            "propertyOrdering": ["score", "analysis"],
                            "properties": {
                                "score": {
                                    "type": "INTEGER",
                                    "minimum": 0,
                                    "maximum": 10,
                                },
                                "analysis": {
                                    "type": "STRING",
                                },
                            },
                        },
                        "pacing_analysis": {
                            "type": "STRING",
                        },
                        "caption_optimization": {
                            "type": "STRING",
                        },
                        "actionable_feedback": {
                            "type": "ARRAY",
                            "minItems": 3,
                            "maxItems": 3,
                            "items": {
                                "type": "STRING",
                            },
                        },
                        "trending_recommendations": {
                            "type": "ARRAY",
                            "minItems": 4,
                            "maxItems": 8,
                            "items": {
                                "type": "STRING",
                            },
                        },
                    },
                },
            },
        }

        primary_model = "gemini-2.5-flash"
        fallback_model = "gemini-1.5-flash"

        try:
            response = await self._request_with_retry(model_name=primary_model, payload=payload)
            analysis, parsed_text = self._parse_and_validate_response(response)
            return analysis, parsed_text, primary_model
        except HTTPException as primary_exc:
            if primary_exc.status_code != 503:
                raise

            self.logger.warning(
                "Primary Gemini model '%s' failed after retries; falling back to '%s'.",
                primary_model,
                fallback_model,
            )

            try:
                response = await self._request_with_retry(model_name=fallback_model, payload=payload)
                analysis, parsed_text = self._parse_and_validate_response(response)
                return analysis, parsed_text, fallback_model
            except HTTPException as fallback_exc:
                raise HTTPException(
                    status_code=503,
                    detail="AI pipeline is currently congested. Please attempt analysis again in 30 seconds.",
                ) from fallback_exc

    def _parse_and_validate_response(self, response: httpx.Response) -> tuple[AnalyzeResponse, str]:
        parsed_text = self._extract_candidate_text(response.json())
        parsed_json = self._extract_json_payload(parsed_text)
        try:
            return AnalyzeResponse.model_validate(parsed_json), parsed_text
        except ValidationError as exc:
            raise HTTPException(status_code=502, detail=f"Invalid AI response schema: {exc}") from exc

    async def _request_with_retry(self, model_name: str, payload: dict[str, Any]) -> httpx.Response:
        endpoint = f"{self.settings.gemini_api_base_url}/v1beta/models/{model_name}:generateContent"
        timeout = httpx.Timeout(timeout=self.settings.request_timeout_seconds)

        async with httpx.AsyncClient(timeout=timeout) as client:
            for attempt in range(self.MAX_RETRIES + 1):
                try:
                    response = await client.post(
                        endpoint,
                        params={"key": self.settings.gemini_api_key},
                        json=payload,
                    )
                    response.raise_for_status()
                    return response
                except httpx.HTTPStatusError as exc:
                    if await self._sleep_if_retryable_status(exc.response.status_code, attempt):
                        continue
                    self._raise_for_status_error(exc)
                except (httpx.TimeoutException, httpx.RequestError) as exc:
                    if await self._sleep_if_retryable_status(503, attempt):
                        continue
                    self._raise_for_transport_error(exc)

        raise HTTPException(status_code=503, detail="Gemini service unavailable after retries")

    async def _sleep_if_retryable_status(self, status_code: int, attempt: int) -> bool:
        if status_code not in self.RETRYABLE_STATUS_CODES or attempt >= self.MAX_RETRIES:
            return False
        await asyncio.sleep(2**(attempt + 1))
        return True

    @staticmethod
    def _raise_for_status_error(exc: httpx.HTTPStatusError) -> None:
        status_code = exc.response.status_code
        if status_code in AIScorerService.RETRYABLE_STATUS_CODES:
            raise HTTPException(status_code=503, detail="Gemini service unavailable after retries") from exc
        error_text = exc.response.text[:300]
        raise HTTPException(status_code=502, detail=f"Gemini API error: {error_text}") from exc

    @staticmethod
    def _raise_for_transport_error(exc: Exception) -> None:
        if isinstance(exc, httpx.TimeoutException):
            raise HTTPException(status_code=503, detail="Gemini request timed out after retries") from exc
        raise HTTPException(status_code=503, detail="Gemini request failed after retries") from exc

    @staticmethod
    def _extract_candidate_text(raw_response: dict[str, Any]) -> str:
        candidates = raw_response.get("candidates", [])
        if not candidates:
            raise HTTPException(status_code=502, detail="Gemini returned no candidates")

        parts = candidates[0].get("content", {}).get("parts", [])
        for part in parts:
            if "text" in part and isinstance(part["text"], str) and part["text"].strip():
                return part["text"]

        raise HTTPException(status_code=502, detail="Gemini response did not contain text output")

    @staticmethod
    def _extract_json_payload(text: str) -> dict[str, Any]:
        try:
            parsed = json.loads(text)
            if not isinstance(parsed, dict):
                raise HTTPException(status_code=502, detail="Gemini returned a non-object JSON payload")
            return parsed
        except json.JSONDecodeError:
            match = re.search(r"\{[\s\S]*\}", text)
            if not match:
                raise HTTPException(status_code=502, detail="Gemini returned non-JSON output")
            try:
                parsed = json.loads(match.group(0))
                if not isinstance(parsed, dict):
                    raise HTTPException(status_code=502, detail="Gemini returned a non-object JSON payload")
                return parsed
            except json.JSONDecodeError as exc:
                raise HTTPException(status_code=502, detail="Failed to parse Gemini JSON output") from exc

    @staticmethod
    def _guess_mime_type(video_url: str) -> str:
        mime, _ = mimetypes.guess_type(video_url)
        if mime and mime.startswith("video/"):
            return mime
        return "video/mp4"

    def _insert_audit_log(self, request_id: str, video_url: str, user_id: str | None) -> str:
        payload = {
            "request_id": request_id,
            "user_id": user_id,
            "input_type": "video",
            "input_payload": {"video_url": video_url},
            "status": "processing",
            "model_provider": "google",
            "model_name": self.settings.gemini_model,
            "model_version": self.settings.gemini_model,
        }
        result = self.supabase.table("ai_audit_logs").insert(payload).execute()

        data = result.data or []
        if not data or "id" not in data[0]:
            raise HTTPException(status_code=500, detail="Failed to create audit log")

        return data[0]["id"]

    def _update_audit_log_success(
        self,
        audit_row_id: str,
        request_id: str,
        output_payload: dict[str, Any],
        latency_ms: int,
        model_version: str,
    ) -> None:
        update_payload = {
            "status": "completed",
            "output_payload": output_payload,
            "latency_ms": latency_ms,
            "error_message": None,
            "model_version": model_version,
            "request_id": request_id,
        }
        self.supabase.table("ai_audit_logs").update(update_payload).eq("id", audit_row_id).execute()

    def _update_audit_log_failure(
        self,
        audit_row_id: str,
        request_id: str,
        error_message: str,
        latency_ms: int,
    ) -> None:
        update_payload = {
            "status": "failed",
            "output_payload": {},
            "latency_ms": latency_ms,
            "error_message": error_message[:1000],
            "model_version": self.settings.gemini_model,
            "request_id": request_id,
        }
        self.supabase.table("ai_audit_logs").update(update_payload).eq("id", audit_row_id).execute()
