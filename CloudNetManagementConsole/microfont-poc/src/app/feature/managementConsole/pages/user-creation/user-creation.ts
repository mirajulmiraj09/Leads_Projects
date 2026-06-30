import { Component, effect } from '@angular/core';
import {
  BUTTON_VISIBILITY,
  ONCLICK_SAVE
} from './../../../../shared/constant/button-signals.constant';

@Component({
  selector: 'app-user-creation',
  templateUrl: './user-creation.html',
  styleUrl: './user-creation.scss'
})
export class UserCreation {

  constructor() {

    // ✅ Show ONLY Save button
    BUTTON_VISIBILITY.set({
      save: true,
      saveNext: false,
      update: false,
      updateNext: false,
      view: false,
      delete: false,
      exit: false,
      reset: false,
    });

    // ✅ Listen for Save click from header
    effect(() => {

      console.log('Checking ONCLICK_SAVE signal:', ONCLICK_SAVE());

      if (ONCLICK_SAVE()) {

        console.log('✅ Save signal received');

        this.save();

        // ✅ Reset signal (VERY IMPORTANT)
        ONCLICK_SAVE.set(false);
      }
    });
  }

  // ✅ Save function
  save(): void {
    console.log('✅ Save button clicked from UserCreation');

    // ✅ Your logic here
    // Example validation or API call

    alert('✅ Saved Successfully');
  }
}