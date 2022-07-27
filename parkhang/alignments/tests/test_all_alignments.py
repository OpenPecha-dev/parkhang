from alignments.models import (
    ImageAlignment,
    Imagegroup,
    TextAlignment,
    Video,
    VideoAlignment,
)
from rest_framework.test import APITestCase
from texts.models import Text, Source, Witness


class AllAlignmentsTestCase(APITestCase):
    source_name = "Working"
    text_name = "Test Text"
    bdrc_imagegroup_id = "IGW000001"
    video_title = "Video title"
    video_url = "https://www.youtube.com/watch?v=2MMM_ggekfE"
    witness_content = "This is witness test content."

    source = None
    alignment_source = None
    image_target = None
    video_target = None
    text_alignment = None
    image_alignment = None
    video_alignment = None
    text_segment_pairs = [
        {
            "source_segment": {"start": 0, "end": 100},
            "target_segment": {"start": 0, "end": 100},
        }
    ]
    image_segment_pairs = [
        {
            "source_segment": {"start": "0", "end": "100"},
            "target_segment": "iiif.bdrc.io/bdr:I2KG210052::I2KG2100520004.jpg/full/max/0/default.jpg",
        }
    ]
    video_segment_pairs = [
        {
            "source_segment": {"start": "0", "end": "100"},
            "target_segment": {"start": "00:00:10", "end": "00:10:00"},
        }
    ]

    @classmethod
    def setUpTestData(cls) -> None:
        cls.source, _ = Source.objects.get_or_create(
            name=cls.source_name,
            is_base=False,
        )
        cls.source_text, _ = Text.objects.get_or_create(name=cls.text_name)
        cls.alignment_source, _ = Witness.objects.get_or_create(
            text=cls.source_text,
            source=cls.source,
            revision=1,
            content=cls.witness_content,
        )
        cls.text_target, _ = Text.objects.get_or_create(name=cls.text_name)
        cls.image_target, _ = Imagegroup.objects.get_or_create(
            bdrc_imagegroup_id=cls.bdrc_imagegroup_id
        )
        cls.video_target, _ = Video.objects.get_or_create(
            title=cls.video_title, url=cls.video_url
        )
        cls.text_alignment, _ = TextAlignment.objects.get_or_create(
            source=cls.alignment_source,
            target=cls.alignment_source,
            alignment=cls.text_segment_pairs,
        )
        cls.image_alignment, _ = ImageAlignment.objects.get_or_create(
            source=cls.alignment_source,
            target=cls.image_target,
            alignment=cls.image_segment_pairs,
        )
        cls.video_alignment, _ = VideoAlignment.objects.get_or_create(
            source=cls.alignment_source,
            target=cls.video_target,
            alignment=cls.video_segment_pairs,
        )

    def test_get_source_alignments(self):
        url = f"/api/alignments/all/{self.source.pk}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["text"], self.alignment_source.text.pk)

        self.assertIn("text", response.data["alignments"])
        self.assertIn("image", response.data["alignments"])
        self.assertIn("video", response.data["alignments"])

        self.assertEqual(
            response.data["alignments"]["text"][0]["target"], self.alignment_source.pk
        )
        self.assertEqual(
            response.data["alignments"]["image"][0]["target"], self.image_target.pk
        )
        self.assertEqual(
            response.data["alignments"]["video"][0]["target"], self.video_target.pk
        )

        self.assertEqual(
            response.data["alignments"]["text"][0]["alignment"], self.text_alignment.pk
        )
        self.assertEqual(
            response.data["alignments"]["image"][0]["alignment"],
            self.image_alignment.pk,
        )
        self.assertEqual(
            response.data["alignments"]["video"][0]["alignment"],
            self.video_alignment.pk,
        )
