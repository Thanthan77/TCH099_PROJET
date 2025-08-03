<?php
require_once(__DIR__.'/../../db/Database.php');

header('Content-Type: application/json');

try {
    $cnx = Database::getInstance();
    
    
    if (!$codeEmploye) {
        http_response_code(400);
        echo json_encode(["error" => "Le paramètre codeEmploye est requis"]);
        exit();
    }


   $query = "
    SELECT 
        r.NUM_RDV,
        DATE_FORMAT(r.JOUR, '%Y-%m-%d') AS DATE_RDV,
        TIME_FORMAT(r.HEURE, '%H:%i')   AS HEURE,
        r.DUREE,
        r.COURRIEL,
        e.CODE_EMPLOYE,
        e.PRENOM_EMPLOYE,
        e.NOM_EMPLOYE,
        e.POSTE,
        s.ID_SERVICE,
        s.NOM         AS NOM_SERVICE,
        s.DESCRIPTION AS DESCRIPTION_SERVICE,
        r.NOTE_CONSULT,
        r.STATUT
    FROM Rendezvous AS r
    JOIN Employe AS e ON r.CODE_EMPLOYE = e.CODE_EMPLOYE
    JOIN Service AS s ON r.ID_SERVICE   = s.ID_SERVICE
    WHERE r.CODE_EMPLOYE = :codeEmploye
    ORDER BY r.JOUR, r.HEURE
";


    $pstmt = $cnx->prepare($query);
    $pstmt->bindValue(':codeEmploye', $codeEmploye);
    $pstmt->execute();
    $resultats = $pstmt->fetchAll(PDO::FETCH_ASSOC);


    $response = [
        'employe' => null,
        'rendezvous' => [],
        'services' => []
    ];

    if (!empty($resultats)) {
        $first = $resultats[0];
        $response['employe'] = [
            'code' => $first['CODE_EMPLOYE'],
            'prenom' => $first['PRENOM_EMPLOYE'],
            'nom' => $first['NOM_EMPLOYE'],
            'poste' => $first['POSTE']
        ];

        $servicesCache = [];
        
        foreach ($resultats as $row) {
            $response['rendezvous'][] = [
                'num_rdv' => $row['NUM_RDV'],
                'date' => $row['DATE_RDV'],
                'heure' => $row['HEURE'],
                'duree' => $row['DUREE'],
                'email' => $row['COURRIEL'],
                'note_consult' => $row['NOTE_CONSULT'], 
                'service_id' => $row['ID_SERVICE']
            ];

            if (!isset($servicesCache[$row['ID_SERVICE']])) {
                $servicesCache[$row['ID_SERVICE']] = true;
                $response['services'][] = [
                    'id' => $row['ID_SERVICE'],
                    'nom' => $row['NOM_SERVICE'],
                    'description' => $row['DESCRIPTION_SERVICE']
                ];
            }
        }
    }

    echo json_encode($response);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Erreur de base de données",
        "details" => $e->getMessage(),
        "query" => $query ?? null
    ]);
} finally {
    $cnx = null;
}