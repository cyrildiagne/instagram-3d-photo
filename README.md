A chrome extension that adds depth parallax (an effect similar to Facebook 3D photos)
on images from instagram profile pages.

It uses [3d-photo-inpainting](https://github.com/vt-vl-lab/3d-photo-inpainting)
running in Colab (free GPU) and Cloud pubsub/storage for communication.

![Demo](media/demo.gif)

# Setup the GCP Project

### Set the default project

```bash
export PROJECT_ID=<your gcp project id>
gcloud config set project $PROJECT_ID
```

### Create a service account for colab to be able to access cloud pubsub & storage.

```bash
export COLAB_SA=insta3d-colab
export COLAB_KEY_FILE=./insta3d-colab-key.json
./scripts/create_colab_key.sh
```

### Create the Pubsub topic and subscription

```bash
gcloud services enable pubsub
```

```bash
export TOPIC_NAME=insta3d
gcloud pubsub topics create $TOPIC_NAME
gcloud pubsub subscriptions create --topic $TOPIC_NAME $TOPIC_NAME-sub
```

### Enable CORS on your bucket

```json
[
  {
    "origin": ["*"],
    "responseHeader": ["Content-Type"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

# Changes with the original 3d-photo-inpainting

- Update `argument.yml` to use custom path + smaller size + custom fps/duration
- Update straight-line and circle paths in `utils.py`
- Set ffmpeg to create 1 keyframe per frame in `mesh.py`
