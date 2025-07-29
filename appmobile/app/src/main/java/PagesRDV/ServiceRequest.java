package PagesRDV;

import com.google.gson.annotations.SerializedName;

public class ServiceRequest {

    @SerializedName("ID_SERVICE")
    private int idService;

    @SerializedName("NOM")
    private String nom;



    public int getIdService() {
        return idService;
    }

    public String getNomService() {
        return nom;
    }


}
