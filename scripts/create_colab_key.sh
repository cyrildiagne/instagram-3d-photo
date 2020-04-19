set -e

function assert_set() {
  var_name=$1
  var_value=$2
  if [ -z "$var_value" ]; then
    red="\033[31m"
    reset="\033[0m"
    printf "${red}ERROR:${reset} Missing required env variable $var_name\n"
  else
    echo "Using $var_name: $var_value"
  fi
}

# Make sure required variables are set.
assert_set PROJECT_ID $PROJECT_ID
assert_set COLAB_SA $COLAB_SA
assert_set COLAB_KEY_FILE $COLAB_KEY_FILE

# Create service account if it doens't exists.
if gcloud iam service-accounts list | grep $COLAB_SA; then
    echo "Service account already exists."
else
    gcloud iam service-accounts \
        create $COLAB_SA \
        --display-name "Insta3D Service Account for Colab."
fi

# Assemble the service account's email.
COLAB_SA_EMAIL=$COLAB_SA@$PROJECT_ID.iam.gserviceaccount.com

# Grand permission.
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member serviceAccount:$COLAB_SA_EMAIL \
  --role roles/storage.objectAdmin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member serviceAccount:$COLAB_SA_EMAIL \
  --role roles/pubsub.editor

# Download the secret key file for your service account.
gcloud iam service-accounts keys create $COLAB_KEY_FILE \
    --iam-account=$COLAB_SA_EMAIL
