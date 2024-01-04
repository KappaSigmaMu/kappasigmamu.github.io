import json
import sys
import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('PINATA_API_KEY')
API_SECRET = os.getenv('PINATA_API_SECRET')


def create_payload(folder_path, metadata):
    payload = []

    payload.append(('pinataMetadata', (None, json.dumps(metadata))))

    for root, _, files in os.walk(os.path.abspath(folder_path)):
        for f in files:
            complete_path = os.path.join(root, f)
            payload.append(('file', (os.sep.join(complete_path.split(
                os.sep)[-2:]), open(complete_path, 'rb'))))

    return payload


def upload_and_pin(folder_path):
    url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'

    headers = {
        'pinata_api_key': API_KEY,
        'pinata_secret_api_key': API_SECRET,
    }

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    metadata = {
        'name': f'kappa-sigma-mu-poi-{timestamp}'
    }

    payload = create_payload(folder_path, metadata)

    response = requests.post(url, files=payload, headers=headers)

    return response


def upload(folder_path):
    response = upload_and_pin(folder_path)
    if response.status_code == 200:
        print(
            f"Folder pinned successfully! Pinata IPFS Hash: {response.json()['IpfsHash']}")
    else:
        print(
            f"Error uploading folder to Pinata: {response.status_code} - {response.text}")


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 upload.py <folder_path>")
        sys.exit(1)

    folder_path = sys.argv[1]

    upload(folder_path)


if __name__ == "__main__":
    main()
