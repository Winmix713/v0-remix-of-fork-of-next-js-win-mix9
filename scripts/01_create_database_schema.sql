-- Create enum type first before using it in table
CREATE TYPE public.match_status_enum AS ENUM ('scheduled', 'live', 'completed', 'postponed', 'cancelled');

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Now create the matches table with the enum type available
CREATE TABLE public.matches (
    id BIGSERIAL NOT NULL,
    match_time TIME WITHOUT TIME ZONE NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    half_time_home_goals INTEGER NULL,
    half_time_away_goals INTEGER NULL,
    full_time_home_goals INTEGER NOT NULL,
    full_time_away_goals INTEGER NOT NULL,
    league TEXT NOT NULL DEFAULT 'Unknown League'::TEXT,
    season TEXT NULL DEFAULT 'Unknown Season'::TEXT,
    attendance INTEGER NULL,
    venue TEXT NULL DEFAULT 'Unknown Venue'::TEXT,
    referee TEXT NULL,
    home_corners INTEGER NULL,
    away_corners INTEGER NULL,
    home_shots INTEGER NULL,
    away_shots INTEGER NULL,
    home_shots_on_target INTEGER NULL,
    away_shots_on_target INTEGER NULL,
    home_yellow_cards INTEGER NULL,
    away_yellow_cards INTEGER NULL,
    home_red_cards INTEGER NULL,
    away_red_cards INTEGER NULL,
    match_status public.match_status_enum NULL DEFAULT 'completed'::public.match_status_enum,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
    CONSTRAINT matches_pkey PRIMARY KEY (id),
    CONSTRAINT valid_match_time CHECK ((match_time IS NOT NULL))
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_teams 
ON public.matches USING btree (home_team, away_team) 
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_matches_league_season 
ON public.matches USING btree (league, season) 
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_matches_match_time 
ON public.matches USING btree (match_time) 
TABLESPACE pg_default;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_matches_updated_at 
    BEFORE UPDATE ON matches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
