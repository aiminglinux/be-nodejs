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
                    sh '/kaniko/executor --context `pwd` --dockerfile `pwd`/Dockerfile --cache=true --cache-repo freeman82/dev-konnect --destination freeman82/dev-konnect:${BUILD_NUMBER} --build-arg VERSION=${BUILD_NUMBER}'
                }
            }
        }
    }
}
