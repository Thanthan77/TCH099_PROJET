package PagesRDV;

import com.google.gson.annotations.SerializedName;

public class HoraireRequest {


    @SerializedName("JOUR")
    private String jourRdv ;

    @SerializedName("HEURE")
    private String heureRDV ;






    public String getJourRdv() {
        return jourRdv ;
    }

    public String getHeureRdv() {
        return heureRDV;
    }


}
