
pipeline {
    agent any

    options {
        timestamps()
        skipStagesAfterUnstable()
    }

    environment {
        BACKEND_IMAGE = 'campusshare-backend'
        FRONTEND_IMAGE = 'campusshare-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out CampusShare source code'
                checkout scm
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} ./backend'
                sh 'docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} ./frontend'
                sh 'docker images | grep campusshare'
            }
        }
    }

    post {
        success {
            echo 'CI succeeded: tests passed and Docker images were built.'
        }
        failure {
            echo 'CI failed. Review the stage logs before deploying.'
        }
    }
}
