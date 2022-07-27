from alignments.models import AlignmentTypes, Video, VideoAlignment
from rest_framework.test import APITestCase
from texts.models import Text, Source, Witness


class VideoAlignmentTestCase(APITestCase):
    source_name = "Working"
    text_name = "Test Text"
    video_title = "Video title"
    video_url = "https://www.youtube.com/watch?v=2MMM_ggekfE"

    source = None
    target = None
    source_text = None
    source_witness = None
    witness_content = "This is witness test content."
    alignment = None
    segment_pairs = [
        {
            "source_segment": {"start": "0", "end": "100"},
            "target_segment": {"start": "00:00:10", "end": "00:10:00"},
        }
    ]

    @classmethod
    def setUpTestData(cls):
        cls.source, _ = Source.objects.get_or_create(
            name=cls.source_name,
            is_base=False,
        )
        cls.source_text, _ = Text.objects.get_or_create(name=cls.text_name)
        cls.source_witness, _ = Witness.objects.get_or_create(
            text=cls.source_text,
            source=cls.source,
            revision=1,
            content=cls.witness_content,
        )
        cls.target, _ = Video.objects.get_or_create(
            title=cls.video_title, url=cls.video_url
        )
        cls.alignment, _ = VideoAlignment.objects.get_or_create(
            source=cls.source_witness, target=cls.target, alignment=cls.segment_pairs
        )

    def test_get_alignment(self):
        url = f"/api/alignments/video/{self.alignment.pk}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.alignment.pk)
        self.assertEqual(response.data["source"]["text"], self.source_text.pk)
        self.assertEqual(response.data["source"]["witness"], self.source_witness.pk)
        self.assertEqual(response.data["target"], self.target.pk)
        self.assertEqual(response.data["type"], AlignmentTypes.VIDEO.label)
