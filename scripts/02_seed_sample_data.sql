-- Insert sample match data for testing
INSERT INTO public.matches (
    match_time, home_team, away_team, 
    half_time_home_goals, half_time_away_goals,
    full_time_home_goals, full_time_away_goals,
    league, season, venue, referee,
    home_corners, away_corners,
    home_shots, away_shots,
    home_shots_on_target, away_shots_on_target,
    home_yellow_cards, away_yellow_cards,
    home_red_cards, away_red_cards,
    match_status
) VALUES 
    ('15:00:00', 'Ferencváros', 'Újpest', 1, 0, 2, 1, 'NB I', '2023/24', 'Groupama Aréna', 'Kovács Péter', 6, 3, 12, 8, 5, 3, 2, 1, 0, 0, 'completed'),
    ('17:30:00', 'MTK Budapest', 'Debrecen', 0, 1, 1, 2, 'NB I', '2023/24', 'Hidegkuti Nándor Stadion', 'Nagy János', 4, 7, 9, 11, 3, 6, 1, 2, 0, 1, 'completed'),
    ('20:00:00', 'Paks', 'Honvéd', 2, 0, 3, 0, 'NB I', '2023/24', 'Paksi FC Stadion', 'Szabó Gábor', 8, 2, 15, 6, 7, 2, 3, 0, 1, 0, 'completed'),
    ('14:00:00', 'Kisvárda', 'Zalaegerszeg', 1, 1, 1, 1, 'NB I', '2023/24', 'Várkerti Stadion', 'Tóth László', 5, 5, 10, 10, 4, 4, 2, 2, 0, 0, 'completed'),
    ('16:30:00', 'Vidi', 'Mezőkövesd', 0, 0, 2, 1, 'NB I', '2023/24', 'MOL Aréna Sóstó', 'Kiss Attila', 3, 4, 8, 7, 4, 3, 1, 3, 0, 0, 'completed');
