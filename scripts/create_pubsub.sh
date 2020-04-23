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
assert_set TOPIC_NAME $TOPIC_NAME

# Set gcloud's default project.
gcloud config set project $PROJECT_ID

# Make sure PubSub is enabled on the project.
gcloud services enable pubsub

# Create topic.
gcloud pubsub topics create $TOPIC_NAME

# Create subscription.
gcloud pubsub topics create $TOPIC_NAME
