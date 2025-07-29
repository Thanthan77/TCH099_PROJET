package com.example.appmobile;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

public class PageMesRDV extends AppCompatActivity implements View.OnClickListener {

    private Button btneffacer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mes_rdv);

        btneffacer=(Button)findViewById(R.id.btnannulerrdv);
        btneffacer.setOnClickListener(this);

    }

    @Override
    public void onClick(View view) {




    }
}
