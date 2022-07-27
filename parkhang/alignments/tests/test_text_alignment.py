from alignments.models import AlignmentTypes, TextAlignment
from rest_framework.test import APITestCase
from texts.models import Text, Source, Witness


class TextAlignmentTestCase(APITestCase):
    text_name = "Test Text"
    source_name = "Working"

    source = None
    source_text = None
    target_text = None
    source_witness = None
    target_witness = None
    witness_content = "This is witness test content."
    alignment = None
    segment_pairs = [
        {
            "source_segment": {"start": 0, "end": 100},
            "target_segment": {"start": 0, "end": 100},
        }
    ]

    @classmethod
    def setUpTestData(cls):
        cls.source, _ = Source.objects.get_or_create(
            name=cls.source_name,
            is_base=False,
        )
        cls.source_text, _ = Text.objects.get_or_create(name=cls.text_name)
        cls.target_text, _ = Text.objects.get_or_create(name=cls.text_name)
        cls.source_witness, _ = Witness.objects.get_or_create(
            text=cls.source_text,
            source=cls.source,
            revision=1,
            content=cls.witness_content,
        )
        cls.target_witness, _ = Witness.objects.get_or_create(
            text=cls.target_text,
            source=cls.source,
            revision=1,
            content=cls.witness_content,
        )
        cls.alignment, _ = TextAlignment.objects.get_or_create(
            source=cls.source_witness,
            target=cls.target_witness,
            alignment=cls.segment_pairs,
        )

    def test_get_alignment(self):
        url = f"/api/alignments/text/{self.alignment.pk}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.alignment.pk)
        self.assertEqual(response.data["source"]["text"], self.source_text.pk)
        self.assertEqual(response.data["source"]["witness"], self.source_witness.pk)
        self.assertEqual(response.data["target"]["text"], self.target_text.pk)
        self.assertEqual(response.data["target"]["witness"], self.target_witness.pk)
        self.assertEqual(response.data["type"], AlignmentTypes.TEXT.label)
