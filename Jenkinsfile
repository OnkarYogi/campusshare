pipeline {
    agent any

    options {
        timestamps()
        skipStagesAfterUnstable()
    }

    environment {
        BACKEND_IMAGE = 'campusshare-backend'
        FRONTEND_IMAGE = 'campusshare-frontend'
        KUBECONFIG = '/var/lib/jenkins/.kube/config'
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
                sh '''
                    set -eu

                    docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} ./backend
                    docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} ./frontend

                    docker images | grep campusshare
                '''
            }
        }

        stage('Transfer Images to Minikube') {
            steps {
                sh '''
                    set -eu

                    echo "Transferring backend image to Minikube..."
                    docker save ${BACKEND_IMAGE}:${BUILD_NUMBER} |
                        docker exec -i minikube ctr -n k8s.io images import -

                    echo "Transferring frontend image to Minikube..."
                    docker save ${FRONTEND_IMAGE}:${BUILD_NUMBER} |
                        docker exec -i minikube ctr -n k8s.io images import -

                    echo "Verifying images in Minikube..."
                    docker exec minikube crictl images | grep campusshare
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    set -eu

                    echo "Updating backend deployment..."
                    kubectl set image deployment/campusshare-backend \
                        backend=${BACKEND_IMAGE}:${BUILD_NUMBER}

                    echo "Updating frontend deployment..."
                    kubectl set image deployment/campusshare-frontend \
                        frontend=${FRONTEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -eu

                    echo "Waiting for backend rollout..."
                    kubectl rollout status deployment/campusshare-backend --timeout=180s

                    echo "Waiting for frontend rollout..."
                    kubectl rollout status deployment/campusshare-frontend --timeout=180s

                    echo "Final deployment status:"
                    kubectl get deployments campusshare-backend campusshare-frontend

                    echo "Deployed image versions:"
                    kubectl get deployments campusshare-backend campusshare-frontend \
                        -o custom-columns='NAME:.metadata.name,IMAGE:.spec.template.spec.containers[*].image'
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD succeeded: tests passed, images transferred, and Kubernetes rollouts completed.'
        }

        failure {
            echo 'CI/CD failed. Review the failed stage and console logs before retrying.'
        }
    }
}
