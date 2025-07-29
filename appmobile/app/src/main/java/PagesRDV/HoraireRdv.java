package PagesRDV;

public class HoraireRdv {
    public String nomService ;
    public String jourRdv ;
    public String heureRdv ;

    public HoraireRdv(String nomService, String jourRdv, String heureRdv) {
        this.heureRdv = heureRdv;
        this.jourRdv = jourRdv ;
        this.nomService = nomService ;
    }

    public String getHeureRdv() {
        return heureRdv;
    }

    public String getJourRdv() {
        return jourRdv;
    }

    public String getNomService() {
        return nomService;
    }
}
