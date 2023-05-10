pipeline {
    agent {
        kubernetes {
            yamlFile 'KubernetesPod.yaml'
            namespace 'jenkins'
        }
    }
    stages {
        stage('Build docker image for dev-konnect') {
            steps {
                sh 'sh 'kaniko --dockerfile=Dockerfile --destination=docker.io/freeman82/dev-konnect:${BUILD_NUMBER} --build-arg VERSION=${BUILD_NUMBER} .''
            }
        }
    }
}
