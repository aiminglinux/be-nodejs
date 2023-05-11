pipeline {
    agent {
        kubernetes {
            namespace 'jenkins'
            yamlFile 'KubernetesPod.yaml'
        }     
    }

    environment {
            DOCKER_IMAGE_BACKEND = "freeman82/dev-konnect:be-devkonnect"
            DOCKER_IMAGE_FRONTEND = "freeman82/dev-konnect:fe-devkonnect"
        }

    stages {
        stage('Build and push BE docker image for dev-konnect') {
            steps {
                container('kaniko') {
                    sh '/kaniko/executor --context `pwd` --dockerfile `pwd`/Dockerfile --cache=true --cache-repo freeman82/dev-konnect --destination DOCKER_IMAGE_BACKEND'
                }
            }
        }
        stage('Build and push FE docker image for dev-konnect') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'githib-creds', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                	git url: 'https://github.com/aiminglinux/vite-tailwind-styled-components.git', branch: 'main', credentialsId: 'githib-creds'
                }
                container('kaniko') {
                    sh '/kaniko/executor --context `pwd` --dockerfile `pwd`/Dockerfile --cache=true --cache-repo freeman82/dev-konnect --destination DOCKER_IMAGE_FRONTEND'
                }
            }
        }
    }    
}
