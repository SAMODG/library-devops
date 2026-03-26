pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Compose Build') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Docker Compose Up') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Check Containers') {
            steps {
                sh 'docker compose ps'
            }
        }
    }

    post {
        success {
            echo 'Déploiement réussi'
        }
        failure {
            echo 'Le pipeline a échoué'
        }
    }
}
