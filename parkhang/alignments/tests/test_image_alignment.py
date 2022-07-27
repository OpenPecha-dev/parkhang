from alignments.models import AlignmentTypes, ImageAlignment, Imagegroup
from rest_framework.test import APITestCase
from texts.models import Text, Source, Witness


class ImageAlignmentTestCase(APITestCase):
    source_name = "Working"
    text_name = "Test Text"
    bdrc_imagegroup_id = "IGW000001"

    source = None
    target = None
    source_text = None
    source_witness = None
    witness_content = "This is witness test content."
    alignment = None
    segment_pairs = [
        {
            "source_segment": {"start": "0", "end": "100"},
            "target_segment": "iiif.bdrc.io/bdr:I2KG210052::I2KG2100520004.jpg/full/max/0/default.jpg",
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
        cls.target, _ = Imagegroup.objects.get_or_create(
            bdrc_imagegroup_id=cls.bdrc_imagegroup_id
        )
        cls.alignment, _ = ImageAlignment.objects.get_or_create(
            source=cls.source_witness, target=cls.target, alignment=cls.segment_pairs
        )

    def test_get_alignment(self):
        url = f"/api/alignments/image/{self.alignment.pk}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.alignment.pk)
        self.assertEqual(response.data["source"]["text"], self.source_text.pk)
        self.assertEqual(response.data["source"]["witness"], self.source_witness.pk)
        self.assertEqual(response.data["target"], self.target.pk)
        self.assertEqual(response.data["type"], AlignmentTypes.IMAGE.label)
