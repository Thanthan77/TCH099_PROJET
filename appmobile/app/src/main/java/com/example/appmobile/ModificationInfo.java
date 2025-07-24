package com.example.appmobile;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class ModificationInfo extends AppCompatActivity implements View.OnClickListener {

    private EditText prenom;
    private EditText nom;
    private EditText nam;
    private EditText naissance;
    private EditText adresse;
    private EditText numCivique;
    private EditText rue;
    private EditText ville;
    private EditText codePost;
    private EditText email;
    private EditText confirmEmail;
    private EditText numCell;

    private Button modifInfo;


    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_modification_profil);

        prenom = (EditText) findViewById(R.id.profil_prenom);
        nom = (EditText) findViewById(R.id.profil_nom);
        nam = (EditText) findViewById(R.id.profil_nam);
        naissance = (EditText) findViewById(R.id.profil_naissance);
        adresse = (EditText) findViewById(R.id.profil_adresse_autocomplete);
        numCivique = (EditText) findViewById(R.id.profil_civique);
        rue = (EditText) findViewById(R.id.profil_rue);
        ville = (EditText) findViewById(R.id.profil_ville);
        codePost = (EditText) findViewById(R.id.profil_postal);
        email = (EditText) findViewById(R.id.profil_email);
        confirmEmail = (EditText) findViewById(R.id.profil_email_confirme);
        numCell = (EditText) findViewById(R.id.profil_tel);
        modifInfo = (Button) findViewById(R.id.btn_appliquer_changements);

        modifInfo.setOnClickListener(this);


        

    }

    @Override
    public void onClick(View view) {

        if (view == modifInfo) {
            if ((numCivique.getText().toString()).length() > 3 ){
                Toast.makeText(this, "Numéro civique érroné", Toast.LENGTH_SHORT).show();
            } if (( numCell.getText().toString()).length() > 10) {
                Toast.makeText(this, "Numéro de cellulaire  érroné", Toast.LENGTH_SHORT).show();
            }
        }





    }
}