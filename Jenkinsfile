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
                sh '''/kaniko/executor version'''
                // sh 'docker push docker.io/freeman82/dev-konnect:v1.0.0'
            }
        }
    }
}
