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
                container('kaniko') {
                    sh '/kaniko/executor version'   
                }
            }
        }
    }
}
