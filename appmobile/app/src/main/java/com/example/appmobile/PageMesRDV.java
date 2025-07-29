package com.example.appmobile;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;


public class PageMesRDV extends AppCompatActivity implements View.OnClickListener {


    private Button btneffacer;
    private TextView textrdv;
    private ListView listView;
    private RDVadaptater adaptater;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mes_rdv);

        SharedPreferences prefs = getSharedPreferences("session", MODE_PRIVATE);
        String token = prefs.getString("token", null);
        String courriel = prefs.getString("courriel", null);

        listView = findViewById(R.id.listRdv);
        adaptater = new RDVadaptater(this, listView);
        listView.setAdapter(adaptater);

        btneffacer = (Button) findViewById(R.id.btnannulerrdv);
        btneffacer.setOnClickListener(this);

    }


    @Override
    public void onClick(View view) {

        if (view.getId() == R.id.btnannulerrdv) {


        }


    }
}
