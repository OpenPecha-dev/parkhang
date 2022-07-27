Named Concepts
---
- `Segment`: set of characters, it can be phrase, sentence, or paragraph
- `Segment Pair`: pair of segments, it can be translation of segment, root and citation, etc
- `Alignment`: a set of `Segment Pairs`, a whole book translations
- `Alignment Type`: type of `Alignment` based on content type like `etext`, `image`, `video` etc 
- `text`: refers to abstract text with title
- `witness`: a particular version/edtition of the text.

Big Idea
---
- All alignments are created on the `witness` level because each `witness` will have different alignment

Text All Alignments API
---
- get all alignments associated to the text

**Endpoint**: GET `/api/alignments/all/{text_id}`

**Schema**:
```json
{
  "text": "111",
  "alignments": {
    "text": [
      { 
        "soruce": "111",
        "target": "111",
        "alignment": "111"
      }
    ],
    "image": [
      {
        "source": "111",
        "target": "111",
        "alignment": "222"
      }
    ],
    "video": [
      {
        "source": "111",
        "target": "111",
        "alignment": "333"
      }
    ]
  }
}
``` 

**Description**:
- `source`: id of the source text
- `alignments`: contains all the associated alignments for the `source`
- `text`: contains all text alignments
- `image`: contains all the image alignments
- `video`: contains all the video alignments
- `target`: id of the target item, it can be either `text`, `image` or `video`
- `alignment`: id of a alignment instance, which contain all the segment pairs

Text2Text Alignment API
---
- get a particular target text alignment for the source text

**Endpoint**: GET `/api/alignments/text/{alignment_id}`

**Schema**:
```json
{
  "id": "111",
  "source": "111",
  "target": "222",
  "type": "text",
  "alignment": [
    {
      "source_segment": {
         "start": "0",
         "end": "100"
      },
      "target_segment": {
         "start": "0",
         "end": "100"
      }
    }
  ]
}
```

**Description**:
- `id` is id of the alignment instance
- `source`: id of the source witness text
- `target`: id of the target witness text
- `type`: type of alignment, it can be either `text`, `image` or `video`. It determines the target content type
- `alignment`: contain all the segments pairs
- `source_segment`: character span of the source text segment
- `target_segment`: character span of the target text segment

Text2Image Alignment API
---
- get image alignment for source text

**Endpoint**: GET `/api/alignments/image/{alignment_id}`
**Schema**:
```json
{
   "id": "111",
  "source": "111",
  "target": "222",
  "type": "image",
  "alignment": [
    {
      "source_segment": {
         "start": "0",
         "end": "100"
      },
      "target_segment": "iiif.bdrc.io/bdr:I2KG210052::I2KG2100520004.jpg/full/max/0/default.jpg"
    }
  ]
}
```

**Description**:
- `id` is id of the alignment instance
- `source`: id of the source witness text
- `target`: id of the imagegroup
- `type`: type of alignment, it can be either `text`, `image` or `video`. It determines the target content type
- `alignment`: contain all the segments pairs
- `source_segment`: character span of the source text segment
- `target_segment`: image url

Text2AV Alignment API
---
- get AV (Audio/Video) alignment for source text

**Endpoint**: GET `/api/alignments/video/{alignment_id}`

**Schema**:
```json
{
   "id": "111",
  "source": "111",
  "target": "222",
  "type": "video",
  "url": "https://www.youtube.com/watch?v=2MMM_ggekfE",
  "alignment": [
    {
      "source_segment": {
         "start": "0",
         "end": "100"
      },
      "target_segment": {
        "start": "00:00:10",
        "end": "00:10:00"
      }
    }
  ]
}
```

**Description**:
- `id` is id of the alignment instance
- `source`: id of the source witness text
- `target`: id of the target video
- `type`: type of alignment, it can be either `text`, `image` or `video`. It determines the target content type
- `alignment`: contain all the segments pairs
- `source_segment`: character span of the source text segment
- `target_segment`: video timestamp
