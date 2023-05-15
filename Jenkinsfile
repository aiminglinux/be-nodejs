pipeline {
    agent any

    stages {
        stage('Copy file to ansible server') {
            steps {
                script {
                    echo 'copy playbook file to ansible server'
                    sshagent(credentials: ['ansible-ssh-key']) {
                        sh 'scp -o StrictHostKeyChecking=no ansible/* freeman@172.16.1.100:/home/freeman/Documents/workspace/dev-konnect/'
                    }
                }
            }
        }

        stage('Execute ansible playbook') {
            steps {
                script {
                    echo 'calling ansible playbook to create a testing namespace'
                    def remote =[:]
                    remote.name = 'ansible-server'
                    remote.host = '172.16.1.100'
                    remote.allowAnyHosts = true

                    withCredentials([sshUserPrivateKey(credentialsId: 'ansible-ssh-key', keyFileVariable: 'keyfile' , passphraseVariable: '', usernameVariable: 'user')]) {
                        remote.user = user
                        remote.identityFile = keyfile
                        sshCommand remote: remote, command: 'ls -l'
                    }
                }
            }
        } 
    }    
}
