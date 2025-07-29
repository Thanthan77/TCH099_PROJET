package PagesRDV;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ListView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.R;

import java.util.ArrayList;
import java.util.List;

public class pagePriseMoment  extends AppCompatActivity {



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_prise_moment);

        Intent intent = getIntent();
        String idService = intent.getStringExtra("id_service");

        List<String> horaires = new ArrayList<>();

        ListView listView = findViewById(R.id.listeHoraire);
        HoraireAdapter adapter = new HoraireAdapter(this, horaires, idService);









    }



}
