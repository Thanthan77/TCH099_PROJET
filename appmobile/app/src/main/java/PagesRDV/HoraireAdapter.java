package PagesRDV;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.appmobile.R;

import java.util.List;

public class HoraireAdapter extends ArrayAdapter<HoraireRequest>  {


    private TextView  nomService ;
    private TextView dateRdv ;
    private TextView heureRdv ;

    private Button btnPrendreRdv ;

    private  int idService;

    private final OnPrendreRdvClickListener listener;



    public interface OnPrendreRdvClickListener {
        void onClick(HoraireRequest horaire);
    }


    public HoraireAdapter(Context context, List<HoraireRequest> horaires, OnPrendreRdvClickListener listener) {
        super(context, 0, horaires);
        this.listener = listener;
        this.idService = idService;;
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

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        HoraireRequest horaire = getItem(position);

        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.activity_horaire_rdv, parent, false);
        }
        nomService = convertView.findViewById(R.id.nomService) ;
        dateRdv = convertView.findViewById(R.id.dateRdv) ;
        heureRdv=convertView.findViewById(R.id.heureRdv) ;
        btnPrendreRdv=convertView.findViewById(R.id.btnPrendreRdv) ;


        nomService.setText(getNomService(idService));
        dateRdv.setText(horaire.getJourRdv());
        heureRdv.setText(horaire.getHeureRdv());

        btnPrendreRdv.setOnClickListener(v -> {
            if (listener != null) {
                listener.onClick(horaire);
            }
        });

        return convertView;
    }

    }




