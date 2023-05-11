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
                    env.DOCKER_CONFIG = '/kaniko/.docker'
                    sh '/kaniko/executor --context `pwd` --dockerfile `pwd`/Dockerfile --cache=true --destination freeman82/dev-konnect:${BUILD_NUMBER} --build-arg VERSION=${BUILD_NUMBER}'
                }
            }
        }
    }
}
