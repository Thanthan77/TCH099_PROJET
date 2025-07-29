package PagesRDV;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.ArrayAdapter;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.R;

import java.util.List;

public class HoraireAdapter extends AppCompatActivity {


    public HoraireAdapter(pagePriseMoment pagePriseMoment, List<String> horaires, String idService) {
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_horaire_rdv);

    }

    private String getNomService(int idService) {
        String nomService;
        switch (idService) {
            case 1:
                nomService = "Consultation générale";
                break;
            case 2:
                nomService = "Suivi de grossesse";
                break;
            case 3:
                nomService = "Suivi de maladies chroniques";
                break;
            case 4:
                nomService = "Dépistage ITSS";
                break;
            case 5:
                nomService = "Vaccination";
                break;
            case 6:
                nomService = "Prélèvement sanguin / test urine";
                break;
            case 7:
                nomService = "Urgence mineure";
                break;
            default:
                nomService = "Service inconnu";
                break;
        }
        return nomService;
    }
}
