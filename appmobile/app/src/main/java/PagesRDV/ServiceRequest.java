package PagesRDV;

import com.google.gson.annotations.SerializedName;

public class ServiceRequest {

    @SerializedName("ID_SERVICE")
    private int idService;

    @SerializedName("NOM")
    private String nom;

    @SerializedName("DESCRIPTION")
    private String description;

    public int getIdService() {
        return idService;
    }

    public String getNomService() {
        return nom;
    }

    public String getDescriptionService() {
        return description;
    }
}
