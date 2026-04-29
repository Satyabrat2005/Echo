"""
Camera Module for Echo Video Memory Assistant
Handles OpenCV camera operations: open, close, capture photos, save with metadata.
"""

import cv2
import os
import logging
from datetime import datetime
from typing import Optional, Tuple

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

PHOTOS_DIR = "captured_photos"


class CameraManager:
    """Manages OpenCV camera for live feed and photo capture."""

    def __init__(self, camera_index: int = 0, photos_dir: str = PHOTOS_DIR):
        self.camera_index = camera_index
        self.photos_dir = photos_dir
        self.cap: Optional[cv2.VideoCapture] = None
        self.is_active = False
        os.makedirs(self.photos_dir, exist_ok=True)

    def open_camera(self) -> bool:
        """Open the camera device. Returns True if successful."""
        if self.is_active and self.cap is not None and self.cap.isOpened():
            logger.info("Camera is already open.")
            return True

        self.cap = cv2.VideoCapture(self.camera_index)
        if not self.cap.isOpened():
            logger.error("Failed to open camera at index %d", self.camera_index)
            self.cap = None
            self.is_active = False
            return False

        self.is_active = True
        logger.info("Camera opened successfully at index %d", self.camera_index)
        return True

    def close_camera(self) -> None:
        """Release the camera device."""
        if self.cap is not None:
            self.cap.release()
            self.cap = None
        self.is_active = False
        logger.info("Camera closed.")

    def read_frame(self) -> Tuple[bool, Optional["cv2.typing.MatLike"]]:
        """Read a single frame from the camera. Returns (success, frame)."""
        if not self.is_active or self.cap is None:
            return False, None
        ret, frame = self.cap.read()
        if not ret:
            logger.warning("Failed to read frame from camera.")
            return False, None
        return True, frame

    def capture_photo(
        self,
        person_name: Optional[str] = None,
        location: Optional[str] = None,
    ) -> Optional[str]:
        """
        Capture a photo from the live camera feed and save it to disk.

        Args:
            person_name: If provided, photo is stored in a sub-folder named after the person.
            location: Optional location metadata embedded in the filename.

        Returns:
            The file path of the saved photo, or None on failure.
        """
        ret, frame = self.read_frame()
        if not ret or frame is None:
            logger.error("Cannot capture photo: no frame available.")
            return None

        return self.save_frame(frame, person_name=person_name, location=location)

    def save_frame(
        self,
        frame: "cv2.typing.MatLike",
        person_name: Optional[str] = None,
        location: Optional[str] = None,
    ) -> Optional[str]:
        """
        Save a given frame (numpy array) to disk.

        Directory layout:
            captured_photos/<person_name>/<timestamp>_<location>.jpg
        or  captured_photos/unknown/<timestamp>.jpg
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        folder = person_name.strip().replace(" ", "_") if person_name else "unknown"
        save_dir = os.path.join(self.photos_dir, folder)
        os.makedirs(save_dir, exist_ok=True)

        loc_tag = f"_{location.strip().replace(' ', '_')}" if location else ""
        filename = f"{timestamp}{loc_tag}.jpg"
        filepath = os.path.join(save_dir, filename)

        success = cv2.imwrite(filepath, frame)
        if success:
            logger.info("Photo saved: %s", filepath)
            return filepath
        else:
            logger.error("Failed to save photo to %s", filepath)
            return None

    def get_photo_list(self, person_name: Optional[str] = None):
        """Return list of saved photo paths, optionally filtered by person."""
        results = []
        search_dir = self.photos_dir
        if person_name:
            search_dir = os.path.join(
                self.photos_dir, person_name.strip().replace(" ", "_")
            )
            if not os.path.isdir(search_dir):
                return results

        for root, _dirs, files in os.walk(search_dir):
            for f in sorted(files):
                if f.lower().endswith((".jpg", ".jpeg", ".png", ".bmp")):
                    results.append(os.path.join(root, f))
        return results

    @property
    def camera_available(self) -> bool:
        return self.is_active and self.cap is not None and self.cap.isOpened()
