package com.example.appmobile;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;

import androidx.appcompat.app.AppCompatActivity;

import java.util.ArrayList;
import java.util.List;


public class PageMesRDV extends AppCompatActivity implements View.OnClickListener {


    private Button btneffacer;

    private ListView listRdv ;

    private List<RdvRequest> rdvList = new ArrayList<>();

    private RDVadaptater adapter;




    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mes_rdv);


        listRdv = findViewById(R.id.listRdv);
        btneffacer = findViewById(R.id.btnannulerrdv);
        btneffacer.setOnClickListener(this);


    }


    @Override
    public void onClick(View view) {

        if (view.getId() == R.id.btnannulerrdv) {


        }


    }

}


