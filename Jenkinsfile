pipeline {
    agent {
        kubernetes {
            namespace 'jenkins'
            yamlFile 'KubernetesPod.yaml'
        }
    }
    stages {
        stage('Build docker image for dev-konnect') {
            steps {
                sh '/kaniko/executor --dockerfile=Dockerfile --destination=docker.io/freeman82/dev-konnect:v1.0.0 --build-arg VERSION=v1.0.0 .'
                sh 'docker push docker.io/freeman82/dev-konnect:v1.0.0'
            }
        }
    }
}
