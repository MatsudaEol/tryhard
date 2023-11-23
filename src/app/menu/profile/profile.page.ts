import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LoadingController } from '@ionic/angular';
import { User } from 'firebase/auth';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  user: User;
  userData: any;
  loading: HTMLIonLoadingElement;
  exibir: boolean = false;
  imageLoaded: boolean = false;
  presentingElement = null;
  altura: number;
  peso: number;
  imc: number | null = null;
  classificacaoIMC: string | null = null;

  // Simule dados de treinos concluídos
  treinosConcluidos = [
    { dia: 1 },
    { dia: 2 },
    { dia: 3 },
    // Adicione mais dias conforme necessário
  ];

  constructor(
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private loadingController: LoadingController
  ) {
    this.userData = {};
    this.loadUserData();
    this.presentingElement = document.querySelector('.ion-page');
  }

  async loadUserData() {
    this.loading = await this.loadingController.create({
      message: 'Carregando...',
      translucent: true,
    });

    await this.loading.present();

    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        this.user = user;
        const userUID = user.uid;

        try {
          this.userData = await this.userService.getUser(userUID);

          // Converte o Timestamp da data de nascimento em uma representação de data legível
          if (this.userData.birth) {
            this.userData.birth = this.formatDate(this.userData.birth.toDate());
          }
        } catch (error) {
          console.error('Erro ao buscar informações do usuário:', error);
        }

        const image = new Image();
        image.src = this.userData.profile || 'https://firebasestorage.googleapis.com/v0/b/tryhard-75312.appspot.com/o/default_profile.png?alt=media&token=a65958d7-167d-4e30-9391-4f92c26366aa';
        image.onload = () => {
          this.imageLoaded = true;

          // Verifique se todos os dados e a imagem foram carregados antes de exibir o conteúdo
          if (this.imageLoaded && this.userData.username && this.userData.email && this.userData.birth && this.userData.phone) {
          }
        };
      }
      this.loading.dismiss();
      this.exibir = true;
    });
  }

  // Método para calcular o IMC
  calcularIMC() {

    this.imc = this.peso / ((this.altura / 100) ** 2);

    if (this.imc < 18.5) {
      console.log('Abaixo do Peso');
      this.classificacaoIMC = 'Abaixo do Peso';
    } else if (this.imc >= 18.5 && this.imc < 24.9) {
      console.log('Peso Normal');
      this.classificacaoIMC = 'Peso Normal';
    } else if (this.imc >= 25 && this.imc < 29.9) {
      console.log('Sobrepeso');
      this.classificacaoIMC = 'Sobrepeso';
    } else if (this.imc >= 30 && this.imc < 34.9) {
      console.log('Obesidade Grau I');
      this.classificacaoIMC = 'Obesidade Grau I';
    } else if (this.imc >= 35 && this.imc < 39.9) {
      console.log('Obesidade Grau II');
      this.classificacaoIMC = 'Obesidade Grau II';
    } else {
      console.log('Obesidade Grau III');
      this.classificacaoIMC = 'Obesidade Grau III';
    }
  }


  // Função para formatar a data no formato 'dd/MM/yyyy'
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
