import json
import os
import urllib.parse
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from google.cloud import storage, pubsub_v1

# Retrieve the project_id and topic_name for PubSub.
pubsub_project_id = os.environ.get('PROJECT_ID', 'cyrildiagne-ml')
pubsub_topic_name = os.environ.get('PUBSUB_TOPIC', 'insta3d')

# Setup the pubsub client.
publisher_client = pubsub_v1.PublisherClient()
topic_path = publisher_client.topic_path(pubsub_project_id, pubsub_topic_name)

# Retrieve the bucket for Storage
storage_bucket_name = os.environ.get('BUCKET_NAME', 'cyrildiagne-ml')

# Setup the storage client.
storage_client = storage.Client()
bucket = storage_client.bucket(storage_bucket_name)

app = Flask(__name__)
CORS(app)


@app.route('/', methods=['GET'])
def hello():
    url = request.args.get('url')
    if url is None:
        return jsonify({'error': 'url parameter missing'}), 400

    # Extract image id from url.
    url = urllib.parse.unquote(url)
    url_id = url[8:].split('?')[0].replace('/', '__')

    # Assemble datafile path.
    data_file = 'insta3d/renders/' + url_id + '/info.json'

    # If a data element already exists return it.
    if bucket.blob(data_file).exists():
        print('item already exists.')
        # url = f'https://storage.googleapis.com/{storage_bucket_name}/{data_file}'
        # res = requests.get(url)
        # print(res.content)
        # return jsonify(res.json())
        data_content = bucket.blob(data_file).download_as_string()
        print(data_file)
        print(data_content)
        return jsonify(json.loads(data_content))

    # Other wise add a new one.
    status = {
        'id': url_id,
        'status': 'queued',
    }
    b = bucket.blob(data_file)
    b.cache_control = 'no-cache, max-age=0'
    b.upload_from_string(json.dumps(status))

    # And add to queue.
    data = json.dumps({
        'id': url_id,
        'url': url,
        'output_file': 'insta3d/renders/' + url_id + '/render.mp4',
    }).encode('utf-8')
    publisher_client.publish(topic_path, data=data).result()

    return jsonify(status)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
