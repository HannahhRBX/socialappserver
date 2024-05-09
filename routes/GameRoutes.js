import express from 'express';
import {GetGameInfo,UpdateGames,SearchGames,GetGamesLibrary,GetGameDetails} from "../controllers/GameController.js";
import {authenticateToken} from "../middleware/Authenticate.js";

const router = express.Router();
// Retrieve
router.get("/search/:searchTerms",SearchGames);
router.get("/page/:page",GetGamesLibrary);
router.get("/search/:searchTerms",SearchGames);
router.get("/gamedetails/:gameId",GetGameDetails);

// Update
router.post("/updategames",authenticateToken,UpdateGames);



export default router;