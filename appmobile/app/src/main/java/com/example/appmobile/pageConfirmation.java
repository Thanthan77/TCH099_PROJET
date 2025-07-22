package com.example.appmobile;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.R;

public class pageConfirmation extends AppCompatActivity {

    private TextView titreconfir;
    private EditText dateconf;
    private EditText timeconfirm;
    private EditText numberrdv;


    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_prise_confirmation);

    }
}