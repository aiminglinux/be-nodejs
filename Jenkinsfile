pipeline {
    agent any

    stages {
        stage('Copy file to ansible server') {
            steps {
                script {
                    echo 'copy playbook file to ansible server'
                    sshagent(credentials: ['my-local-pc']) {
                        sh 'scp -o StrictHostKeyChecking=no ansible/* freeman@172.16.1.100:/freeman/tmp'
                    }
                }
            }
        }
    }    
}
