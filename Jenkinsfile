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
                withCredentials([usernamePassword(credentialsId: 'gilab-creds', usernameVariable: 'GITLAB_USERNAME', passwordVariable: 'GITLAB_PASSWORD')]) {
                    git url: 'git@gitlab.com:aiming.fb/freeman-argocd.git', branch: 'main', credentialsId: 'gitlab-creds'
                }
            }
        }
        // stage('Update YAML file') {
        //     steps {
        //         sh 'sed -i "s/freeman82\\/dev-konnect:be-devkonnect/freeman82\\/dev-konnect:be-devkonnect-$BUILD_NUMBER/" dev/be-devkonnect-deploy.yaml'
        //         sh "git add dev/be-devkonnect-deploy.yaml"
        //         sh "git commmit -m '[Jenkins] Update image tag to be-devkonnect-$BUILD_NUMBER'"
        //     }
        // }
        // stage("Push to Git Repository") {
        //     steps {
        //         withCredentials([file(credentialsId: 'gitlab-creds', variable: 'secretFile')]) {
        //             sh "git push -u origin main"
        //         }
        //     }
        // }
    }    
}
