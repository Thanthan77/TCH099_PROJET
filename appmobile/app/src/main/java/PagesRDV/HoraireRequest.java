package PagesRDV;

import com.google.gson.annotations.SerializedName;

public class HoraireRequest {

    @SerializedName("ID_SERVICE")
    private int idService;

    @SerializedName("JOUR")
    private String jourRdv ;

    @SerializedName("HEURE")
    private String heureRDV ;


    public int getIdService() {
        return idService;
    }




    public String getJourRdv() {
        return jourRdv ;
    }

    public String getHeureRdv() {
        return heureRDV;
    }
}
