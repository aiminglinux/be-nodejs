pipeline {
    // agent {
    //     kubernetes {
    //         namespace 'jenkins'
    //         yamlFile 'KubernetesPod.yaml'
    //     }     
    // }
    agent any
    // environment {
    //         DOCKER_IMAGE_BACKEND = "freeman82/dev-konnect:be-devkonnect"
    //     }

    stages {
        // stage('Build and push BE image for dev-konnect') {
        //     steps {
        //         container('kaniko') {
        //             sh '/kaniko/executor --context `pwd` --dockerfile `pwd`/Dockerfile --cache=true --cache-repo freeman82/dev-konnect --destination $DOCKER_IMAGE_BACKEND-$BUILD_NUMBER'
        //         }
        //     }
        // }

        stage('Checkout argocd repo') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'gitlab-creds', usernameVariable: 'GITLAB_USERNAME', passwordVariable: 'GITLAB_PASSWORD')]) {
                    git url: 'https://gitlab.com/aiming.fb/freeman-argocd.git', branch: 'main', credentialsId: 'gitlab-creds'
                }
            }
        }
        stage('Update YAML file') {
            steps {
                sh 'sed -i "s/freeman82\\/dev-konnect:be-devkonnect/freeman82\\/dev-konnect:be-devkonnect-$BUILD_NUMBER/" dev/be-devkonnect-deploy.yaml'
            }
        }
        stage("Push to Git Repository") {
            steps {
                withCredentials([usernamePassword(credentialsId: 'gitlab-creds', usernameVariable: 'GITLAB_USERNAME', passwordVariable: 'GITLAB_PASSWORD')]) {
                    sh 'git config --global user.email "jenkins@example.com"'
                    sh 'git config --global user.name "Jenkins"'
                    sh "git add dev/be-devkonnect-deploy.yaml"
                    sh "git commit -m '[Jenkins] Update image tag to be-devkonnect-$BUILD_NUMBER'"
                    sh "git push -u origin main"
                }
            }
        }
    }    
}
