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
                    sh '/kaniko/executor --context `pwd` --dockerfile `pwd`/Dockerfile --cache=true --destination freeman82/dev-konnect:${BUILD_NUMBER} --build-arg VERSION=${BUILD_NUMBER}'
                    // sh 'docker push freeman82/dev-konnect:${BUILD_NUMBER}'   
                    // sh 'cat /kaniko/.docker/config.json'
                }
            }
        }
    }
}
