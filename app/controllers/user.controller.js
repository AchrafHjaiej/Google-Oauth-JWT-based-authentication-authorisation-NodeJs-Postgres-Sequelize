exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.EtudiantBoard = (req, res) => {
  res.status(200).send("Etudiant Content.");
};

exports.AdminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.FormateurBoard = (req, res) => {
  res.status(200).send("Formateur Content.");
};
