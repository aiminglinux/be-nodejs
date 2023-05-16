pipeline {
    agent {
        kubernetes {
            namespace 'jenkins'
            yamlFile 'KubernetesPod.yaml'
        }     
    }

    environment {
            DOCKER_IMAGE_BACKEND = "freeman82/dev-konnect:be-devkonnect"
        }

    stages {
        stage('Build and push BE image for dev-konnect') {
            steps {
                container('kaniko') {
                    sh '/kaniko/executor --context `pwd` --dockerfile `pwd`/Dockerfile --cache=true --cache-repo freeman82/dev-konnect --destination $DOCKER_IMAGE_BACKEND-$BUILD_NUMBER'
                }
            }
        }

    }    
}
