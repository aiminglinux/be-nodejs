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

        stage('Checkout argocd repo') {
            steps {
                git credentialsId: 'gitlab-creds', url: 'git@gitlab.com:aiming.fb/freeman-argocd.git'
            }
        }
        stage('Update YAML file') {
            steps {
                sh 'sed -i "s/freeman82\\/dev-konnect:be-devkonnect/freeman82\\/dev-konnect:be-devkonnect-$BUILD_NUMBER/" dev/be-devkonnect-deploy.yaml'
                git add: 'dev/be-devkonnect-deploy.yaml'
            }
        }
        stage('Commit and push changes') {
            steps {
                git commit: "[Jenkins] Update image tag to be-devkonnect-$BUILD_NUMBER", 
                    credentialsId: 'gitlab-creds', 
                    message: "[Jenkins] Update image tag to be-devkonnect-$BUILD_NUMBER"
                git push: [
                    credentialsId: 'gitlab-creds', 
                    tag: 'be-devkonnect-$BUILD_NUMBER'
                ]
            }

    }    
}
