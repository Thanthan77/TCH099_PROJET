package com.example.appmobile;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class modificationMotPasse extends AppCompatActivity implements View.OnClickListener {

    private EditText mdpbefore;
    private EditText mdpafter;
    private EditText mdpconfirm;

    private Button btnmdpchangement;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_modification_mdp);

        mdpbefore = (EditText) findViewById(R.id.ancien_mdp);
        mdpafter = (EditText) findViewById(R.id.nouveau_mdp);
        mdpconfirm = (EditText) findViewById(R.id.confirmer_mdp);
        btnmdpchangement=(Button) findViewById(R.id.btn_appliquer_changement);

        btnmdpchangement.setOnClickListener(this);

    }

    @Override
    public void onClick(View view) {

    }
}