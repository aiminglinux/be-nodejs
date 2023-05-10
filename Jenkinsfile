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
                    sh '/kaniko/executor --dockerfile=Dockerfile --destination=docker.io/freeman82/dev-konnect:${BUILD_NUMBER} --build-arg VERSION=${BUILD_NUMBER} .'
                    sh 'docker push docker.io/freeman82/dev-konnect:${BUILD_NUMBER}'   
                }
            }
        }
    }
}
