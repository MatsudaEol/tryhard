import { Component, OnInit } from '@angular/core';
import { PopoverController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from 'src/app/services/user.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { ExerciseService } from 'src/app/services/exercise.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  listExercises: any[] = [];
  userName: string;
  currentDay: string;
clickedCards: { [key: number]: boolean } = {};

  constructor(
    private authService: AuthenticationService,
    public popoverController: PopoverController,
    private afAuth: AngularFireAuth,
    private userService: UserService,
    private router: Router,
    private exerciseService: ExerciseService,
    private alertCtrl: AlertController
  ) {
    this.userName = 'Visitante';
  }

  async ngOnInit() {
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        this.userName = await this.userService.getUserName(user.uid);

        const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const today = new Date().getDay();
        this.currentDay = daysOfWeek[today];

        this.exerciseService.getExercises(user.uid).subscribe(exercicios => {
          // console.log('Dados dos exercícios:', exercicios);
          this.listExercises = exercicios;
        });
      } else {
        this.exerciseService.clearUserExercises();
      }
    });
  }

  loadUserExercises(userId: string) {
    this.exerciseService.getExercises(userId).subscribe(exercicios => {
      this.listExercises = exercicios;
    });
  }

  async closePopover() {
    await this.popoverController.dismiss();
  }

  async mostrarAlerta() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmação',
      message: 'Tem certeza que deseja sair da conta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Ação de cancelamento');
          }
        }, {
          text: 'Sair',
          cssClass: 'danger',
          handler: () => {
            this.logout(); // Chama a função de logout após a confirmação
          }
        }
      ]
    });

    await alert.present();
  }



  logout() {
    this.authService.logoutUser().then(() => {
      this.router.navigate(['/login']).then(() => {
        window.location.reload();
      });
    }).catch(error => {
      console.log('Erro ao fazer logout:', error);
    });
  }

  onCardClick(index: number) {
    this.clickedCards[index] = !this.clickedCards[index];
  }

}
