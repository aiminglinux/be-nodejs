pipeline {
    agent any

    stages {
        stage('Copy file to ansible server') {
            steps {
                script {
                    echo 'copy playbook file to ansible server'
                    withCredentials([usernamePassword(credentialsId: 'my-local-pc', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                       sh "sshpass -p '${PASSWORD}' scp -o StrictHostKeyChecking=no ansible/k8s.yaml freeman@172.16.1.100:/home/freeman/tmp"     
                    }
                }
            }
        }
    }    
}
